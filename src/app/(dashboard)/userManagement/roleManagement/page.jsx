"use client";
import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiEye, FiEdit2, FiLock, FiUnlock, FiPlus } from "react-icons/fi";
import RoleManagementFilter from "../../../components/roleManagement/filters/RoleManagementFilter";
import { getRoleTypes } from "@/services/authService";
import { changeRoleStatus } from "@/services/roleService";
import { SuccessModal, ErrorModal } from "@/app/components/shared/SuccessErrorModal";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

const page = () => {
  useTheme();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoleTypes();
        if (response.success && Array.isArray(response.data)) {
          const formatted = response.data.map((item) => ({
            id: item.role_id,
            roleName: item.role_name,
            description: item.role_description,
            status: item.status_name,
            quantityUsers: item.quantity_users,
            permissions: item.permissions,
          }));

          setData(formatted);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const handleStatus = async (roleId, currentStatus) => {
    const newStatusId = currentStatus === "Activo" ? 2 : 1;

    const payload = {
      rol_id: roleId,
      new_status: newStatusId,
    };
    setLoading(true);
    try {
      const response = await changeRoleStatus(payload);
      if (response.success) {
        setModalMessage(response.data);
        setSuccessOpen(true);
        setData((prevData) =>
          prevData.map((role) =>
            role.id === roleId
              ? {
                  ...role,
                  status: currentStatus === "Activo" ? "Inactivo" : "Activo",
                }
              : role
          )
        );
      }
    } catch (error) {
      setModalMessage(error?.response?.data?.detail ?? "Error");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data
    .filter((item) => item.roleName.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => (statusFilter === "" ? true : item.status === statusFilter));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <div className="p-6 w-full bg-surface min-h-screen parametrization-page">
        <h1 className="text-2xl font-bold mb-6 text-primary">Role Management</h1>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Introduce a role name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full parametrization-input pl-10 pr-4 py-2"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="parametrization-filter-button">
            <FiFilter /> Filter by
          </button>
          <RoleManagementFilter
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          <button onClick={() => router.push("/userManagement/roleManagement/newRole?mode=create")} className="parametrization-action-button">
            <FiPlus /> Add role
          </button>
        </div>

        <div className="overflow-x-auto bg-card shadow rounded-xl parametrization-table">
          <table className="w-full text-left">
            <thead className="parametrization-table-header text-sm">
              <tr>
                <th className="px-6 py-3">Role name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Permissions</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="parametrization-table-body text-sm">
              {currentData.map((item, index) => (
                <tr key={index} className="group parametrization-table-row">
                  <td className="px-6 py-3 whitespace-nowrap text-primary">{item.roleName}</td>
                  <td className="px-6 py-3 text-secondary">{item.description}</td>
                  <td className="px-6 py-3 text-center text-secondary">{item.quantityUsers}</td>
                  <td className="py-3 text-secondary">
                    <ul className="list-disc list-inside">
                      {item.permissions.map((perm) => (
                        <li key={perm.id}>{perm.description}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 text-white py-1 rounded-full text-xs font-medium parametrization-badge ${
                        item.status === "Activo" ? "parametrization-badge-1" : "parametrization-badge-6"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => router.push(`/userManagement/roleManagement/newRole?id=${item.id}&mode=view`)}
                        className="parametrization-action-button-sm"
                      >
                        <FiEye className="text-secondary" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/userManagement/roleManagement/newRole?id=${item.id}&mode=edit`)}
                        className="parametrization-action-button-sm"
                      >
                        <FiEdit2 className="text-secondary" />
                        <span>Edit</span>
                      </button>
                      <button type="button" onClick={() => handleStatus(item.id, item.status)} className="parametrization-action-button-sm">
                        {item.status === "Activo" ? (
                          <>
                            <FiLock className="text-danger" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <FiUnlock className="text-success" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-secondary py-6 parametrization-empty">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 text-sm text-secondary">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="parametrization-pagination-button">
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded-lg ${currentPage === pageNum ? "parametrization-pagination-button active" : "border hover:bg-gray-100"}`}
                >
                  {pageNum}
                </button>
              ))}

            {totalPages > 5 && <span>...</span>}
          </div>

          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="parametrization-pagination-button">
            Next →
          </button>
        </div>
      </div>

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Successfull" message={modalMessage} />
      <ErrorModal isOpen={errorOpen} onClose={() => setErrorOpen(false)} title="Failed" message={modalMessage} />
    </>
  );
};

export default page;
