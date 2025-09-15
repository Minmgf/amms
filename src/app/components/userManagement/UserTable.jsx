"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { getUsersList } from "../../../services/authService";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./userDetailsModal";
import { useRouter } from 'next/navigation';
import PermissionGuard from "@/app/(auth)/PermissionGuard";
import { CiFilter } from "react-icons/ci";
import * as Dialog from '@radix-ui/react-dialog';

const columnHelper = createColumnHelper();

export default function UserTable() {
  useTheme();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const columns = [
    columnHelper.accessor("name", {
      header: "Full Name",
      cell: (info) => {
        const user = info.row.original;
        const fullName = `${user.name} ${user.first_last_name} ${
          user.second_last_name || ""
        }`.trim();
        return fullName;
      },
      enableSorting: true,
    }),
    columnHelper.accessor("type_document_name", {
      header: "Document Type",
      cell: (info) => (
        <span className="parametrization-badge bg-surface text-secondary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("document_number", {
      header: "Document Number",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue() || "No disponible",
      enableSorting: true,
    }),
    columnHelper.accessor("status_name", {
      header: "Status",
      cell: (info) => (
        <span
          className={`parametrization-badge ${
            info.getValue() === "Activo"
              ? "parametrization-badge-5"
              : info.getValue() === "Pendiente"
              ? "parametrization-badge-4"
              : "parametrization-badge-1"
          }`}
        >
          {info.getValue()}
        </span>
      ),
      enableSorting: true,
    }),
    columnHelper.accessor("roles", {
      header: "Roles",
      cell: (info) => {
        const roles = info.getValue();
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
          return <span className="text-secondary">Sin roles</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role, index) => (
              <span
                key={index}
                className="parametrization-badge parametrization-badge-8"
              >
                {typeof role === 'object' && role.name ? role.name : role}
              </span>
            ))}
          </div>
        );
      },
      enableSorting: false,
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/sigma/userManagement/${user.id}`;
              }}
              className="parametrization-action-button bg-surface hover:bg-accent text-secondary hover:text-white p-2 rounded-theme-md flex items-center justify-center transition-all"
              title="View"
            >
              <FaEye className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForEdit(user);
                setIsEditModalOpen(true);
              }}
              className="parametrization-action-button bg-accent hover:bg-primary text-white p-2 rounded-theme-md flex items-center justify-center transition-all"
              title="Edit"
            >
              <FaEdit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // No hace nada por ahora
              }}
              className="parametrization-action-button bg-error hover:bg-error text-white p-2 rounded-theme-md flex items-center justify-center transition-all"
              title="Disable"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        );
      },
      enableSorting: false,
    }),
  ];

  // Cargar datos de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsersList();
        if (response.success) {
          setData(response.data);
        } else {
          setError("Error al cargar los usuarios");
        }
      } catch (err) {
        setError("Error al cargar los usuarios: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar datos basado en los filtros
  const filteredData = useMemo(() => {
    return data.filter((user) => {
      const fullName = `${user.name} ${user.first_last_name} ${
        user.second_last_name || ""
      }`.trim();
      const matchesGlobal =
        globalFilter === "" ||
        fullName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(globalFilter.toLowerCase())) ||
        user.document_number.toString().includes(globalFilter);

      const matchesStatus =
        statusFilter === "" || user.status_name === statusFilter;
      const matchesRole =
        roleFilter === "" ||
        user.roles.some((role) => role.name === roleFilter);

      return matchesGlobal && matchesStatus && matchesRole;
    });
  }, [data, globalFilter, statusFilter, roleFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleUserCreated = () => {
    // Recargar la lista de usuarios después de crear uno nuevo
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsersList();
        if (response.success) {
          setData(response.data);
        }
      } catch (err) {
        setError("Error al recargar los usuarios: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  };

  // Funciones para manejar los filtros
  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setGlobalFilter("");
    setIsFilterModalOpen(false);
  };

  // Función para manejar navegación al hacer clic en una fila
  const handleUserClick = (user) => {
    window.location.href = `/sigma/userManagement/${user.id}`;
  };

  // Obtener valores únicos para filtros
  const uniqueStatuses = [...new Set(data.map((user) => user.status_name))];
  const uniqueRoles = [
    ...new Set(
      data.flatMap((user) =>
        user.roles.map((role) => (typeof role === "object" ? role.name : role))
      )
    ),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaExclamationTriangle className="text-error text-4xl mb-4" />
        <p className="text-error text-theme-lg font-theme-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-theme">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-theme-2xl font-theme-bold text-primary">User Management</h2>
        
      </div>

      {/* Filters */}
      <div className=" flex gap-4 mb-6">
        <div className="relative">
          {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /> */}
          <input
            type="text"
            placeholder="Search user"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input-theme px-10"
          />
        </div>


        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="btn-theme btn-secondary flex items-center gap-2"
        >
          <CiFilter className="w-4 h-4" />
          Filter by
        </button>
        <PermissionGuard
          allowedRoles={["Administrator", "HR Manager"]}
          allowedPermissions={["users.create"]}
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-theme  btn-primary flex items-center gap-2"
          >
            <FaUserPlus className="w-4 h-4" />
            Add User
          </button>
        </PermissionGuard>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-secondary text-theme-lg">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="overflow-hidden">
              <table className="min-w-full border-collapse parametrization-table">
                <thead className="parametrization-table-header">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="parametrization-table-cell text-left text-theme-xs font-theme-medium text-secondary uppercase tracking-wider cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-secondary">
                                {header.column.getIsSorted() === "asc" ? (
                                  <FaSortUp />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <FaSortDown />
                                ) : (
                                  <FaSort />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-surface divide-y border-primary">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleUserClick(row.original)}
                      className="parametrization-table-row cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="parametrization-table-cell whitespace-nowrap text-theme-sm text-primary"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="parametrization-pagination px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="parametrization-pagination-button"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="parametrization-pagination-button ml-3"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-theme-sm text-secondary">
                      Showing{" "}
                      <span className="font-theme-medium">
                        {table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-theme-medium">
                        {Math.min(
                          (table.getState().pagination.pageIndex + 1) *
                            table.getState().pagination.pageSize,
                          filteredData.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-theme-medium">{filteredData.length}</span>{" "}
                      results
                    </p>
                  </div>
                  <nav
                    className="relative z-0 inline-flex rounded-theme-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="parametrization-pagination-button rounded-l-md"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                      const pageIndex = i;
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => table.setPageIndex(pageIndex)}
                          className={`parametrization-pagination-button ${
                            table.getState().pagination.pageIndex === pageIndex
                              ? "active"
                              : ""
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      );
                    })}

                    {table.getPageCount() > 5 && (
                      <>
                        <span className="parametrization-pagination-ellipsis relative inline-flex items-center px-4 py-2">
                          ...
                        </span>
                        <button
                          onClick={() =>
                            table.setPageIndex(table.getPageCount() - 2)
                          }
                          className="parametrization-pagination-button"
                        >
                          {table.getPageCount() - 1}
                        </button>
                        <button
                          onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                          }
                          className="parametrization-pagination-button"
                        >
                          {table.getPageCount()}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="parametrization-pagination-button rounded-r-md"
                    >
                      Next →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {isEditModalOpen && selectedUserForEdit && (
        <UserDetailsModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUserForEdit(null);
          }}
          userData={selectedUserForEdit}
          onUserUpdated={handleUserCreated}
        />
      )}

      {/* Modal de Crear Usuario */}
      <AddUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Modal de Filtros */}
      <Dialog.Root open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 w-full max-w-md">
            <div className="p-6 card-theme rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-theme-xl font-theme-bold text-primary">Filters</Dialog.Title>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-secondary hover:text-primary"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-theme-sm font-theme-medium text-secondary mb-2">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-theme w-full"
                  >
                    <option value="">All roles</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClearFilters}
                  className="btn-theme btn-error flex-1"
                >
                  Clean
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="btn-theme btn-primary flex-1"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}