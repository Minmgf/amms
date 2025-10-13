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
 * Retorna la clase CSS para el badge de estado
 * @param {string} status - El estado del servicio
 * @returns {string} Clases CSS para el badge
 */
const getStatusColor = (status) => {
  const colors = {
    Activo: "bg-green-100 text-green-800",
    Inactivo: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
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
    accessorKey: "unit_of_measure",
    header: "Unidad de Medida",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text">
        {row.getValue("unit_of_measure")}
      </div>
    ),
  },
  {
    accessorKey: "taxes",
    header: "Impuestos",
    cell: ({ row }) => (
      <div className="text-sm parametrization-text">
        {row.getValue("taxes")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status");
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
    header: "Acciones",
    cell: ({ row }) => {
      const service = row.original;
      return (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleEdit(service)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700"
            title="Editar servicio"
            aria-label="Editar servicio"
          >
            <FaPen className="w-3 h-3" /> Editar
          </button>
          <button
            onClick={() => handleDelete(service)}
            className="inline-flex items-center px-2.5 py-1.5 gap-2 border text-xs font-medium rounded border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700"
            title="Eliminar servicio"
            aria-label="Eliminar servicio"
          >
            <FaTrash className="w-3 h-3" /> Eliminar
          </button>
        </div>
      );
    },
  },
];

