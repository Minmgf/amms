import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

function ServicesModal({ isOpen, onClose, onSelectService }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Lista de servicios de ejemplo
  const services = [
    { id: 1, name: "Servicio Activo 1" },
    { id: 2, name: "Servicio Activo 2" },
    { id: 3, name: "Servicio Activo 3" },
    { id: 4, name: "Servicio Activo 4" },
    { id: 5, name: "Servicio Activo 5" },
    { id: 6, name: "Servicio Activo 6" },
    { id: 7, name: "Servicio Activo 7" },
    { id: 8, name: "Servicio Activo 8" },
    { id: 1, name: "Servicio Activo 1" },
    { id: 2, name: "Servicio Activo 2" },
    { id: 3, name: "Servicio Activo 3" },
    { id: 4, name: "Servicio Activo 4" },
    { id: 5, name: "Servicio Activo 5" },
    { id: 6, name: "Servicio Activo 6" },
    { id: 7, name: "Servicio Activo 7" },
    { id: 8, name: "Servicio Activo 8" },
  ];

  // Filtrar servicios según búsqueda
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectService = (serviceName) => {
    onSelectService(serviceName);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-primary">Servicios Activos</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
         <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="parametrization-input w-full pl-10"
              aria-label="Search services"
              autoFocus
            />
          </div>
        </div>

        {/* Services List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredServices.length > 0 ? (
            <ul className="space-y-1">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectService(service.name)}
                    className="w-full text-left px-4 py-3 text-secondary hover:bg-gray-100 transition-colors"
                    aria-label={`Select ${service.name}`}
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No se encontraron servicios
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicesModal;