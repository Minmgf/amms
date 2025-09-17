"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FiSearch, FiXCircle, FiCheckCircle, FiUsers, FiFilter, FiEye, FiEdit2, FiLock, FiUnlock, FiPlus } from "react-icons/fi";
import RoleManagementFilter from "../../../components/rolesManagement/RoleManagementFilter";
import { getRoleTypes } from "@/services/authService";
import { createRole, updateRole, changeRoleStatus } from "@/services/roleService";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import { useTheme } from "@/contexts/ThemeContext";

import RoleFormModal from "@/app/components/rolesManagement/RoleFormModal";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

const page = () => {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([]);

  // Estados para el RoleFormModal (Agregar/Editar Rol)
  const [isRoleFormModalOpen, setIsRoleFormModalOpen] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState("add"); // 'add' o 'edit'
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoleTypes();
        if (response.success && Array.isArray(response.data)) {
          if (response.success && Array.isArray(response.data)) {
            setData(formatRoles(response.data));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const refreshRoles = async () => {
    const response = await getRoleTypes();
    if (response.success && Array.isArray(response.data)) {
      setData(formatRoles(response.data));
    }
  };

  const formatRoles = (data) =>
    data.map((item) => ({
      id: item.role_id,
      roleName: item.role_name,
      description: item.role_description,
      statusId: item.status,
      status: item.status_name,
      quantityUsers: item.quantity_users,
      permissions: item.permissions,
    }));

  // Funciones para manejar el RoleFormModal
  const handleOpenRoleFormModal = (mode, roleId) => {
    const role = data.find(r => r.id === roleId);
    setRoleFormMode(mode);
    setSelectedRole(role);
    setIsRoleFormModalOpen(true);
  }

  const handleCloseRoleFormModal = () => {
    setIsRoleFormModalOpen(false);
    setSelectedRole(null);
    setRoleFormMode("add");
  }

  const handleSaveRole = async (roleData, selectedPermissions) => {
    try {
      if (roleFormMode === "add") {
        // Lógica para guardar un nuevo rol
        const payload = {
          name: roleData.roleName,
          description: roleData.description,
          permissions: Array.from(roleData.permissions).map(p => p.id),
        };

        const newRole = await createRole(payload);

        if (newRole) {
          setModalMessage("Role created successfully");
          setSuccessOpen(true);
          // Actualizar la lista de roles con el nuevo rol llamando el endpoint nuevamente
          await refreshRoles();
        }
        handleCloseRoleFormModal();
      } else if (roleFormMode === "edit" && selectedRole) {
        // Lógica para actualizar un rol existente
        const payload = {
          role_id: selectedRole.id,
          name: roleData.roleName,
          description: roleData.description,
          permissions: Array.from(roleData.permissions).map(p => p.id),
        };
        const updatedRole = await updateRole(payload.role_id, payload);

        if (updatedRole.success) {
          setModalMessage("Role updated successfully");
          setSuccessOpen(true);

          await refreshRoles();
        }
      }
      handleCloseRoleFormModal();
    } catch (error) {
      setModalMessage(`Error al ${roleFormMode === 'add' ? 'crear' : 'actualizar'} el tipo: ${error.message}`)
      setErrorOpen(true);
    }
  };

  //---------------------------------------------//
  const handleOpenStatusConfirm = useCallback((roleId, currentStatusId) => {
    const role = data.find(r => r.id === roleId);
    const actionText = currentStatusId === 1 ? "desactivar" : "activar";

    setPendingStatusChange({ roleId, currentStatusId });
    setConfirmMessage(`Esta seguro que quiere ${actionText} el rol "${role?.roleName}"?`);
    setConfirmModalOpen(true);
  }, [data]);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!pendingStatusChange) return;

    const { roleId, currentStatusId } = pendingStatusChange;
    const newStatusId = currentStatusId === 1 ? 2 : 1;

    const payload = {
      rol_id: roleId,
      new_status: newStatusId,
    };

    setLoading(true);
    setConfirmModalOpen(false);

    try {
      const response = await changeRoleStatus(payload);
      if (response.success) {
        setModalMessage(response.data);
        setSuccessOpen(true);

        // Refrescar datos para asegurar consistencia
        setTimeout(async () => {
          await refreshRoles();
        }, 500);
      }
    } catch (error) {
      setModalMessage(error?.response?.data?.detail ?? "Error changing role status");
      setErrorOpen(true);
    } finally {
      setLoading(false);
      setPendingStatusChange(null);
    }
  }, [pendingStatusChange, refreshRoles]);

  const handleCancelStatusChange = useCallback(() => {
    setConfirmModalOpen(false);
    setPendingStatusChange(null);
    setConfirmMessage("");
  }, []);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("roleName", {
        header: "Nombre Rol",
        cell: info => (
          <div className="text-primary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => (
          <div className="text-secondary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("quantityUsers", {
        header: "Usuarios",
        cell: info => (
          <div className="text-secondary">
            {info.getValue()}
          </div>
        ),
      }),

      columnHelper.accessor("statusId", {
        header: "Estado",
        cell: info => {
          const statusId = info.getValue();
          const statusName = info.row.original.status;
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusId === 1
                ? 'bg-green-100 text-green-800'
                : 'bg-pink-100 text-pink-800'
                }`}
            >
              {statusName}
            </span>
          );

        },
      }),
      columnHelper.accessor("id", {
        header: "Acciones",
        cell: info => {
          const statusId = info.row.original.statusId;
          return (
            <div className="flex space-x-2">
              <PermissionGuard permission={17}>
                <button
                  area-label="Detail Button"
                  onClick={() => handleOpenRoleFormModal("view", info.getValue())}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Ver detalles"
                >
                  <FiEye className="text-secondary" />
                </button>
              </PermissionGuard>
              <button
                area-label="Edit Button"
                onClick={() => handleOpenRoleFormModal("edit", info.getValue())}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Editar"
              >
                <FiEdit2 className="text-secondary" />
              </button>
              <button
                area-label="Change Status Button"
                onClick={() => handleOpenStatusConfirm(info.getValue(), statusId)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title={statusId === 1 ? "Inactivar" : "Activar"}
              >
                {statusId === 1 ?
                  <FiXCircle className="text-secondary" />
                  :
                  <FiCheckCircle className="text-secondary" />
                }
              </button>
            </div>
          )
        },
      }),

    ], [data]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.roleName.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesStatus = statusFilter === "" || item.status === statusFilter;
      setFilterModalOpen(false)
      return matchesSearch && matchesStatus;
    });
  }, [data, globalFilter, statusFilter]);

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">Gestión de Roles</h1>
          </div>
          {/* Filter, Search and Add */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div class="relative flex-1 max-w-md">

              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-72">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Introduce el nombre de un rol..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>

            <button
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
              onClick={() => setFilterModalOpen(true)}

            >
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filtrar por</span>
            </button>
            <PermissionGuard permission={14}>
              <button
                onClick={() => handleOpenRoleFormModal("add")}
                className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
              >
                <FiUsers className="w-4 h-4" />
                <span className="text-sm">Añadir Rol</span>
              </button>
            </PermissionGuard>
          </div>

          { /* Table */}
          <TableList
            columns={columns}
            data={filteredData}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </div>
      <RoleFormModal
        isOpen={isRoleFormModalOpen}
        onClose={handleCloseRoleFormModal}
        mode={roleFormMode} // 'add' o 'edit'
        roleData={selectedRole} // Datos del brand en modo edición
        onSave={handleSaveRole} // Se ejecuta al guardar nuevo brand
        setSelectedPermissions={selectedPermissions}
      />
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title="Confirmar cambio de estado"
        message={confirmMessage}
        confirmText={pendingStatusChange?.currentStatusId === 1 ? "Desactivar" : "Activar"}
        cancelText="Cancel"
      />
      <RoleManagementFilter
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        statusFilter={statusFilter}
        onApply={(newStatus) => setStatusFilter(newStatus)}
      />
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Exitoso" message={modalMessage} />
      <ErrorModal isOpen={errorOpen} onClose={() => setErrorOpen(false)} title="Fallido" message={modalMessage} />
    </>
  );
};

export default page;
