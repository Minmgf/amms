"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiEye } from "react-icons/fi";
import { createColumnHelper } from "@tanstack/react-table";
import NavigationMenu from "../../../components/parametrization/ParameterNavigation";
import StatusListModal from "../../../components/parametrization/StatusListModal";
import AddModifyStatusModal from "../../../components/parametrization/AddModifyStatusModal";
import FilterSection from "@/app/components/parametrization/FilterSection";
import TableList from "@/app/components/shared/TableList";
import {
  SuccessModal,
  ErrorModal,
} from "../../../components/shared/SuccessErrorModal";

import {
  getStatuesCategories,
  getStatuesByCategory,
  createStatueItem,
  updateStatue,
  toggleStatueStatus,
} from "@/services/parametrizationService";

import { useTheme } from "@/contexts/ThemeContext";
import PermissionGuard from "@/app/(auth)/PermissionGuard";

// Componente principal
const StatusParameterizationView = () => {
  const { currentTheme } = useTheme();

  const [activeMenuItem, setActiveMenuItem] = useState("Estados");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal Detalles (lista de estados por categoría)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parametersData, setParametersData] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(false);

  // Modal Form (add/edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Modales de feedback
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessModal = (msg) => {
    setSuccessMessage(msg);
    setIsSuccessModalOpen(true);
  };
  const showErrorModal = (msg) => {
    setErrorMessage(msg);
    setIsErrorModalOpen(true);
  };

  const [id, setId] = useState("");

  // Obtener ID de usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  // ===== Cargar categorías (Status)
  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      const response = await getStatuesCategories();
      // Backend -> UI
      const mapped = (response ?? []).map((item) => ({
        id: item.id_statues_categories,
        name: item.name,
        description: item.description,
        type: "Status",
      }));
      setData(mapped);
    } catch (err) {
      console.error("❌ StatusView: Error al cargar categorías:", err);
      showErrorModal(`Error loading Status categories: ${err.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Cargar estados por categoría
  const fetchParametersByCategory = async (categoryId) => {
    setLoadingParameters(true);
    try {
      const response = await getStatuesByCategory(categoryId);
      const mapped = (response ?? []).map((item) => {
        const isActive =
          (item.estado ?? "").toString().toLowerCase() === "activo";
        return {
          id: item.id_statues,
          typeName: item.name,
          name: item.name,
          description: item.description,
          status: isActive ? "Active" : "Inactive",
          isActive,
        };
      });
      setParametersData(mapped);
    } catch (err) {
      showErrorModal(`Error loading status list: ${err.message}`);
      setParametersData([]);
    } finally {
      setLoadingParameters(false);
    }
  };

  // Duplicados por nombre
  const validateDuplicateName = (name, excludeId = null) => {
    const n = (name ?? "").trim().toLowerCase();
    return parametersData.some(
      (p) => p.typeName.toLowerCase() === n && p.id !== excludeId
    );
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleMenuItemChange = (item) => setActiveMenuItem(item);

  // ===== Handlers Detalles
  const handleViewDetails = async (categoryId) => {
    const category = data.find((d) => d.id === categoryId);
    if (!category) return;
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
    await fetchParametersByCategory(categoryId);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
    setParametersData([]);
  };

  // ===== Handlers Form
  const handleAddParameter = () => {
    setFormMode("add");
    setSelectedParameter(null);
    setIsFormModalOpen(true);
  };

  const handleEditParameter = (parameterId) => {
    const parameter = parametersData.find((p) => p.id === parameterId);
    if (!parameter) return;
    setFormMode("modify");
    setSelectedParameter(parameter);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedParameter(null);
    setFormMode("add");
  };

  const handleSaveParameter = async (parameterData) => {
    try {
      if (formMode === "add") {
        if (validateDuplicateName(parameterData.typeName)) {
          throw new Error(
            `A status with the name "${parameterData.typeName}" already exists in this category`
          );
        }
        // Crear estado
        const payload = {
          name: parameterData.typeName,
          description: parameterData.description,
          statues_category: selectedCategory.id, // relación con la categoría
          responsible_user: id,
        };
        await createStatueItem(payload);

        // Si debe quedar inactivo, toggle luego de crear
        if (!parameterData.isActive) {
          try {
            await fetchParametersByCategory(selectedCategory.id);
            const latest = await getStatuesByCategory(selectedCategory.id);
            const created = latest.find(
              (p) => p.name === parameterData.typeName
            );
            if (created?.id_statues) {
              await toggleStatueStatus(created.id_statues);
            }
          } catch (e) {
            console.warn("⚠️ StatusView: toggle tras crear falló:", e);
          }
        }

        await fetchParametersByCategory(selectedCategory.id);
        showSuccessModal(
          `Status "${parameterData.typeName}" has been created successfully.`
        );
      } else {
        // Editar estado
        if (
          validateDuplicateName(parameterData.typeName, selectedParameter.id)
        ) {
          throw new Error(
            `A status with the name "${parameterData.typeName}" already exists in this category`
          );
        }

        const updatePayload = {
          name: parameterData.typeName,
          description: parameterData.description,
          responsible_user: id,
        };
        await updateStatue(selectedParameter.id, updatePayload);

        // Cambió el switch activo/inactivo
        if (parameterData.isActive !== selectedParameter.isActive) {
          try {
            await toggleStatueStatus(selectedParameter.id);
          } catch (e) {
            console.warn("⚠️ StatusView: toggle al actualizar falló:", e);
          }
        }

        await fetchParametersByCategory(selectedCategory.id);
        showSuccessModal(
          `Status "${parameterData.typeName}" has been updated successfully.`
        );
      }

      handleCloseFormModal();
    } catch (err) {
      console.error("❌ StatusView: Error al guardar:", err);
      const msg = `Error ${
        formMode === "add" ? "creating" : "updating"
      } status: ${err.message}`;
      showErrorModal(msg);
      throw new Error(msg);
    }
  };

  // ==================== TABLA PRINCIPAL ====================
  const columnHelper = createColumnHelper();


  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nombre categoría",
        cell: (info) => <div className="font-medium text-primary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("description", {
        header: "Descripción",
        cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
      }),
      columnHelper.accessor("id", {
        header: "Detalles",
        cell: (info) => (
          <PermissionGuard permission={31}>
            <button
              onClick={() => handleViewDetails(info.getValue())}
              className="parametrization-action-button p-2 transition-colors lg:opacity-0 group-hover:opacity-100"
              title="Ver detalles"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </PermissionGuard>
        ),
      }),
    ],
    [handleViewDetails]
  );

  return (
    <div className="parametrization-page p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="parametrization-header text-2xl md:text-3xl font-bold">
            Parametrización
          </h1>
        </div>

        {/* Filter Section */}
        <FilterSection
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          placeholder="Search categories..."
        />

        {/* Navigation */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={setActiveMenuItem}
          />
        </div>

        {/* Table using TableList component */}
        <PermissionGuard permission={28}>
          <TableList
            columns={columns}
            data={data}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </PermissionGuard>
      </div>

      {/* Modal Detalles */}
      <StatusListModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        categoryName={selectedCategory?.name || ""}
        data={parametersData}
        loading={loadingParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
      />

      {/* Modal Form */}
      <AddModifyStatusModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        status={selectedParameter}
        category={selectedCategory?.name || ""}
        onSave={handleSaveParameter}
      />

      {/* Feedback */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
      />
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  );
};

export default StatusParameterizationView;
