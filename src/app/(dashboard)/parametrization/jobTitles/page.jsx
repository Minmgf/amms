"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFilter, FiEdit3, FiBell, FiEye, FiUsers } from "react-icons/fi";
import { createColumnHelper } from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import DepartmentModal from "../../../components/parametrization/DepartmentModal";
import FilterSection from "@/app/components/parametrization/FilterSection";
import TableList from "@/app/components/shared/TableList";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from "@/services/parametrizationService";
import {
  SuccessModal,
  ErrorModal,
} from "@/app/components/shared/SuccessErrorModal";

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState("Job Titles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userId, setUserId] = useState("");

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
      } catch (err) {}
    }
  }, []);

  // Función para obtener datos del backend
  const fetchData = async (menuItem = "Job Titles") => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDepartments();

      if (Array.isArray(response)) {
        const formatted = response.map((d) => ({
          id: d.id_employee_department,
          department: d.name,
          description: d.description,
          idStatues: d.id_statues,
          status: d.estado,
        }));
        setData(formatted);
      } else if (response.data) {
        const formatted = response.data.map((d) => ({
          id: d.id_employee_department,
          department: d.name,
          description: d.description,
          idStatues: d.id_statues,
          status: d.estado,
        }));
        setData(formatted);
      } else {
        setError("Formato inesperado en la respuesta");
        setData([]);
      }
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambien las dependencias
  useEffect(() => {
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  const handleViewDetails = (departmentId) => {
    const department = data.find((d) => d.id === departmentId);
    if (department) {
      const normalized = {
        id: department.id,
        department: department.department,
        description: department.description,
        idStatues: department.idStatues,
        status: department.status,
        jobTitles: department.jobTitles || [],
      };

      setSelectedDepartment(normalized);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      if (modalMode === "add") {
        const payload = {
          name: departmentData.categoryName,
          description: departmentData.description,
          responsible_user: userId,
          charges: departmentData.jobTitles.map((job) => ({
            name: job.name,
            description: job.description,
          })),
        };

        const response = await createDepartment(payload);
        await fetchData();
        setModalMessage(response.message);
        setSuccessOpen(true);
      } else {
        try {
          const departmentId = selectedDepartment.id;
          const payload = {
            name: departmentData.categoryName,
            description: departmentData.description,
            responsible_user: userId,
          };

          const response = await updateDepartment(departmentId, payload);
          await fetchData();
          setModalMessage(response.message);
          setSuccessOpen(true);
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.name ||
            "Failed to update department";
          setModalMessage(message);
          setErrorOpen(true);
        }
      }
    } catch (error) {
      setModalMessage(error.response.data.name || "Failed");
      setErrorOpen(true);
    }
  };

  // Definir columnas usando TanStack Table
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => (
          <div className="font-medium text-primary">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Details",
        cell: (info) => (
          <button
            onClick={() => handleViewDetails(info.getValue())}
            className="parametrization-action-button p-2 transition-colors lg:opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [data]
  );

  return (
    <>
      <div className="parametrization-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
              Parameterization
            </h1>
          </div>

          {/* Filter and Add Department Section */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between lg:justify-start">
            {/* Filter Section */}
            <FilterSection
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              placeholder="Search categories..."
            />

            <button
              onClick={handleAddDepartment}
              className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit"
            >
              <FiUsers className="w-4 h-4" />
              <span className="text-sm">Add department</span>
            </button>
          </div>

          {/* Navigation Menu(component) */}
          <div className="mb-6 md:mb-8">
            <NavigationMenu
              activeItem={activeMenuItem}
              onItemClick={handleMenuItemChange}
            />
          </div>

          {/* Table */}
          <TableList
            columns={columns}
            data={data}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </div>

      {/* Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        departmentData={selectedDepartment}
        onSave={handleSaveDepartment}
        onStatusChange={fetchData}
        existingDepartments={data}
      />
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Successful"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Failed"
        message={modalMessage}
      />
    </>
  );
};

export default ParameterizationView;
