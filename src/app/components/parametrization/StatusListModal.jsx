"use client";
import React, { useEffect, useState } from "react";
import { FiX, FiEdit3 } from "react-icons/fi";

const StatusListModal = ({
  isOpen,
  onClose,
  categoryName,
  data = [],
  loading = false,
  onAddParameter,     // abrir modal de creación
  onEditParameter,    // recibe (id)
  onToggleStatus,     // opcional: async (id) => void
}) => {
  const [modalData, setModalData] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  // Sincronizar datos y bloquear scroll de fondo
  useEffect(() => {
    if (isOpen) {
      setModalData(data);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, data]);

  // Cerrar con click en backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleEdit = (id) => {
    onEditParameter && onEditParameter(id);
  };

  const handleToggle = async (id) => {
    if (!onToggleStatus) return;
    try {
      setTogglingId(id);
      await onToggleStatus(id);
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="text-gray-500">Categoría: </span>
            <span className="text-gray-900">{categoryName}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Descripción
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Status
                    </th> */}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : modalData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Datos no disponibles
                      </td>
                    </tr>
                  ) : (
                    modalData.map((item, idx) => {
                      // const isActive =
                      //   item.isActive ??
                      //   (item.status
                      //     ? item.status === "Active"
                      //     : (item.estado ?? "").toString().toLowerCase() === "activo");

                      return (
                        <tr key={item.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                            {item.typeName || item.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                            {item.description}
                          </td>
                          {/* Los estados NO tienen estados
                          <td className="px-6 py-4 text-sm border-r border-gray-200">
                            <div className="flex items-center gap-3">
                              
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-pink-100 text-pink-800"
                                }`}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </span>

                              {onToggleStatus && (
                                <button
                                  onClick={() => handleToggle(item.id)}
                                  disabled={togglingId === item.id}
                                  className="text-xs px-3 py-1 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  title="Toggle status"
                                >
                                  {togglingId === item.id ? "..." : "Toggle"}
                                </button>
                              )}
                            </div>
                          </td>
                          */}
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                            >
                              <FiEdit3 className="w-3 h-3 mr-1.5" />
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* No se puede ñadarnuevo estado 
          <div className="flex justify-center">
            <button
              onClick={onAddParameter}
              className="btn-theme btn-primary relative"
            >
              Añadir parámetro
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default StatusListModal;