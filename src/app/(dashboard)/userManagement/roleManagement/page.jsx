"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FiSearch, FiXCircle, FiCheckCircle, FiUsers, FiFilter, FiEye, FiEdit2, FiLock, FiUnlock, FiPlus } from "react-icons/fi";
import RoleManagementFilter from "../../../components/roleManagement/filters/RoleManagementFilter";
import { getRoleTypes } from "@/services/authService";
import { createRole, updateRole, changeRoleStatus } from "@/services/roleService";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/app/components/shared/SuccessErrorModal";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

import RoleFormModal from "@/app/components/rolesManagement/RoleFormModal";
import TableList from "@/app/components/shared/TableList";
import { createColumnHelper } from "@tanstack/react-table";
import React from "react";

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
    const actionText = currentStatusId === 1 ? "deactivate" : "activate";

    setPendingStatusChange({ roleId, currentStatusId });
    setConfirmMessage(`Are you sure you want to ${actionText} the role "${role?.roleName}"?`);
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
        header: "Role name",
        cell: info => (
          <div className="text-primary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="text-secondary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("quantityUsers", {
        header: "Users",
        cell: info => (
          <div className="text-secondary">
            {info.getValue()}
          </div>
        ),
      }),

      columnHelper.accessor("statusId", {
        header: "Status",
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
        header: "Actions",
        cell: info => {
          const statusId = info.row.original.statusId;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleOpenRoleFormModal("edit", info.getValue())}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="View details"
              >
                <FiEdit2 className="text-secondary" />
              </button>
              <button
                onClick={() => handleOpenStatusConfirm(info.getValue(), statusId)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title={statusId === 1 ? "Inactivate" : "Activate"}
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
      return matchesSearch && matchesStatus;
    });
  }, [data, globalFilter, statusFilter]);

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">Role Management</h1>
          </div>
          {/* Filter, Search and Add */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            <div class="relative flex-1 max-w-md">

              <div className="flex items-center parametrization-input rounded-md px-3 py-2 w-72">
                <FiSearch className="text-secondary w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Introduce a role name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>

            <button className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit">
              <FiFilter className="filter-icon w-4 h-4" />
              <span className="text-sm">Filter by</span>
            </button>

            <button
              onClick={() => handleOpenRoleFormModal("add")}
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
            >
              <FiUsers className="w-4 h-4" />
              <span className="text-sm">Add Role</span>
            </button>
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
        title="Confirm Status Change"
        message={confirmMessage}
        confirmText={pendingStatusChange?.currentStatusId === 1 ? "Deactivate" : "Activate"}
        cancelText="Cancel"
      />
      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Successfull" message={modalMessage} />
      <ErrorModal isOpen={errorOpen} onClose={() => setErrorOpen(false)} title="Failed" message={modalMessage} />
    </>
  );
};

export default page;