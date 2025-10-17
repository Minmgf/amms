import PermissionGuard from "@/app/(auth)/PermissionGuard";
import { FaPen, FaTrash, FaHashtag } from "react-icons/fa";

/**
 * Formatea un valor numérico a moneda colombiana (COP)
 * @param {number} price - El precio a formatear
 * @returns {string} Precio formateado
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatea la visualización de impuestos
 * @param {number} taxRate - La tasa de impuesto
 * @param {boolean} isVatExempt - Si está exento de IVA
 * @returns {string} Texto formateado de impuesto
 */
const formatTaxDisplay = (taxRate, isVatExempt) => {
  if (isVatExempt) return "Exento";
  return `${taxRate}%`;
};

/**
 * Retorna la clase CSS para el badge de estado basado en el ID
 * Los IDs son inmutables, por lo que los colores son consistentes
 * @param {number} statusId - El ID del estado del servicio
 * @returns {string} Clases CSS para el badge
 */
const getStatusColor = (statusId) => {
  const colors = {
    1: "bg-green-100 text-green-800", // Activo
    2: "bg-red-100 text-red-800",     // Inactivo
  };
  return colors[statusId] || "bg-gray-100 text-gray-800";
};

/**
 * Genera la configuración de columnas para la tabla de servicios
 * @param {Function} handleEdit - Función para manejar la edición de un servicio
 * @param {Function} handleDelete - Función para manejar la eliminación de un servicio
 * @returns {Array} Configuración de columnas para TanStack Table
 */
export const getServiceColumns = (handleEdit, handleDelete) => [
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center gap-2">
        <FaHashtag className="w-4 h-4" />
        ID
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm parametrization-text font-medium">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text font-medium">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "base_price",
    header: "Precio Base",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text font-semibold">
        {formatPrice(row.getValue("base_price"))}
      </div>
    ),
  },
  {
    accessorKey: "unit_name",
    header: "Unidad de Medida",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text">
        {row.getValue("unit_name")}
      </div>
    ),
  },
  {
    accessorKey: "tax_rate",
    header: "Impuestos",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text">
        {formatTaxDisplay(row.original.tax_rate, row.original.is_vat_exempt)}
      </div>
    ),
  },
  {
    accessorKey: "status_name",
    header: "Estado",
    cell: ({ row }) => {
      const statusName = row.getValue("status_name");
      const statusId = row.original.status_id;
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const service = row.original;
      return (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PermissionGuard permission={141}>
            <button
              onClick={() => handleEdit(service)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
              title="Editar servicio"
              aria-label="Editar servicio"
            >
              <FaPen className="w-3 h-3" /> Editar
            </button>
          </PermissionGuard>
          <PermissionGuard permission={144}>
            <button
              onClick={() => handleDelete(service)}
              className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
              title="Eliminar servicio"
              aria-label="Eliminar servicio"
            >
              <FaTrash className="w-3 h-3" /> Eliminar
            </button>
          </PermissionGuard>
        </div>
      );
    },
  },
];

